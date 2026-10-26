import { createRepository } from './repository.js'
export const User = createRepository('users', ['role_id', 'name', 'email', 'mobile', 'company', 'password_hash', 'active'])
