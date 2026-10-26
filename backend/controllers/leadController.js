/**
 * Lead Controller
 * Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.
 * 
 * Handles lead management operations including Google Sheets synchronization.
 * This is proprietary software - unauthorized use is prohibited.
 */

import { z } from 'zod'
import { query } from '../config/database.js'
import { googleSheetsService } from '../services/googleSheetsService.js'

const leadSchema = z.object({
	lead_number: z.string().min(1).optional().or(z.literal('')),
	customer_name: z.string().min(1),
	mobile: z.string().optional(),
	email: z.string().email().optional().or(z.literal('')),
	status: z.enum(['New', 'Contacted', 'Follow-up', 'Quotation Sent', 'Won', 'Lost']).default('New'),
	expected_value: z.coerce.number().min(0).default(0),
	follow_up_date: z.string().optional(),
	notes: z.string().optional(),
})

export async function listLeads(request, response, next) {
	try {
		const search = `%${request.query.search || ''}%`
		const result = await query('SELECT * FROM leads WHERE customer_name ILIKE $1 OR lead_number ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [search, Number(request.query.limit || 25), Number(request.query.offset || 0)])
		response.json(result.rows)
	} catch (error) { next(error) }
}

export async function createLead(request, response, next) {
	try {
		const lead = leadSchema.parse(request.body)
		const result = await query(
			`INSERT INTO leads (lead_number, customer_name, mobile, email, status, expected_value, follow_up_date, notes)
			 VALUES ('LEAD-' || upper(substr(md5(random()::text), 1, 8)), $1, $2, NULLIF($3, ''), $4, $5, $6, $7) RETURNING *`,
			[lead.customer_name, lead.mobile || null, lead.email || '', lead.status, lead.expected_value, lead.follow_up_date || null, lead.notes || null],
		)
		response.status(201).json(result.rows[0])
	} catch (error) { next(error) }
}

/**
 * Sync a single lead to Google Sheets
 */
export async function syncLeadToSheets(request, response, next) {
	try {
		const { id } = request.params

		// Fetch the lead from database
		const leadResult = await query('SELECT * FROM leads WHERE id = $1', [id])
		if (leadResult.rows.length === 0) {
			return response.status(404).json({ error: 'Lead not found' })
		}

		const lead = leadResult.rows[0]

		// Sync to Google Sheets
		const syncResult = await googleSheetsService.syncLeadToSheets(lead)

		// Update lead record with sync status
		if (syncResult.success) {
			await query(
				`UPDATE leads SET sync_status = $1, last_synced_at = datetime('now'), google_sheets_row_id = $2, sync_error_message = NULL WHERE id = $3`,
				['synced', syncResult.rowNumber, id]
			)
		} else {
			await query(
				`UPDATE leads SET sync_status = $1, sync_error_message = $2 WHERE id = $3`,
				['failed', syncResult.error, id]
			)
		}

		response.json({
			success: syncResult.success,
			message: syncResult.message || syncResult.error,
			status: syncResult.status,
			lead: { ...lead, sync_status: syncResult.status }
		})
	} catch (error) { next(error) }
}

/**
 * Sync all pending leads to Google Sheets
 */
export async function syncPendingLeads(request, response, next) {
	try {
		// Fetch all pending leads
		const result = await query('SELECT * FROM leads WHERE sync_status = $1 ORDER BY created_at ASC', ['pending'])
		const pendingLeads = result.rows

		if (pendingLeads.length === 0) {
			return response.json({
				message: 'No pending leads to sync',
				total: 0,
				synced: 0,
				failed: 0
			})
		}

		// Sync all leads
		const syncResults = await googleSheetsService.syncLeadsToSheets(pendingLeads)

		// Update each lead with sync result
		for (const result of syncResults.results) {
			const lead = pendingLeads.find(l => l.lead_number === result.leadNumber)
			if (lead) {
				if (result.success) {
					await query(
						`UPDATE leads SET sync_status = $1, last_synced_at = datetime('now'), google_sheets_row_id = $2, sync_error_message = NULL WHERE id = $3`,
						['synced', result.rowNumber, lead.id]
					)
				} else {
					await query(
						`UPDATE leads SET sync_status = $1, sync_error_message = $2 WHERE id = $3`,
						['failed', result.error, lead.id]
					)
				}
			}
		}

		response.json({
			message: `Sync completed: ${syncResults.synced} synced, ${syncResults.failed} failed`,
			total: syncResults.total,
			synced: syncResults.synced,
			failed: syncResults.failed,
			details: syncResults.results
		})
	} catch (error) { next(error) }
}

/**
 * Retry sync for a failed lead
 */
export async function retryFailedSync(request, response, next) {
	try {
		const { id } = request.params

		// Fetch the lead
		const leadResult = await query('SELECT * FROM leads WHERE id = $1 AND sync_status = $2', [id, 'failed'])
		if (leadResult.rows.length === 0) {
			return response.status(404).json({ error: 'Lead not found or not in failed state' })
		}

		const lead = leadResult.rows[0]

		// Attempt sync again
		const syncResult = await googleSheetsService.syncLeadToSheets(lead)

		// Update lead record
		if (syncResult.success) {
			await query(
				`UPDATE leads SET sync_status = $1, last_synced_at = datetime('now'), google_sheets_row_id = $2, sync_error_message = NULL WHERE id = $3`,
				['synced', syncResult.rowNumber, id]
			)
		} else {
			await query(
				`UPDATE leads SET sync_error_message = $1 WHERE id = $2`,
				[syncResult.error, id]
			)
		}

		response.json({
			success: syncResult.success,
			message: syncResult.message || syncResult.error,
			status: syncResult.status
		})
	} catch (error) { next(error) }
}

/**
 * Get sync status of a lead
 */
export async function getSyncStatus(request, response, next) {
	try {
		const { id } = request.params

		const result = await query('SELECT id, lead_number, sync_status, last_synced_at, sync_error_message FROM leads WHERE id = $1', [id])
		if (result.rows.length === 0) {
			return response.status(404).json({ error: 'Lead not found' })
		}

		const lead = result.rows[0]
		const statusDisplay = googleSheetsService.getSyncStatusDisplay(lead.sync_status, lead.last_synced_at)

		response.json({
			...lead,
			statusDisplay
		})
	} catch (error) { next(error) }
}
