import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Validator to use when an admin creates a user
 * from the users management screen
 */
export const createUserValidator = vine.create({
  fullName: vine.string().trim().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
})

/**
 * Validator to use when an admin updates a user. The email must stay
 * unique, ignoring the user being edited, and the password is optional
 * (left empty means "keep the current password").
 */
export const updateUserValidator = vine.create({
  fullName: vine.string().trim().nullable(),
  email: email().unique({
    table: 'users',
    column: 'email',
    filter: (db, _, field) => {
      db.whereNot('id', field.meta.userId)
    },
  }),
  password: password().optional(),
})
