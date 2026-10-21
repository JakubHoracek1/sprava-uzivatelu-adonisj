import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * UsersController handles the users management screen. It lets a
 * signed in user list, create, edit and delete users.
 */
export default class UsersController {
  /**
   * Display the list of all users
   */
  async index({ view }: HttpContext) {
    const users = await User.query().orderBy('id', 'asc')
    return view.render('pages/users/index', { users })
  }

  /**
   * Display the form for creating a new user
   */
  async create({ view }: HttpContext) {
    return view.render('pages/users/create')
  }

  /**
   * Create a new user
   */
  async store({ request, response, session }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(createUserValidator)
    const user = await User.create({ fullName, email, password })

    session.flash('success', `Uživatel ${user.email} byl vytvořen`)
    response.redirect().toRoute('users.index')
  }

  /**
   * Display the form for editing an existing user
   */
  async edit({ params, view }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return view.render('pages/users/edit', { user })
  }

  /**
   * Update an existing user
   */
  async update({ params, request, response, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const { fullName, email, password } = await request.validateUsing(updateUserValidator, {
      meta: { userId: user.id },
    })

    user.merge({ fullName, email })
    if (password) {
      user.password = password
    }
    await user.save()

    session.flash('success', `Uživatel ${user.email} byl upraven`)
    response.redirect().toRoute('users.index')
  }

  /**
   * Delete a user. The signed in user cannot delete themselves.
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)

    if (user.id === auth.user!.id) {
      session.flash('error', 'Nemůžeš smazat sám sebe')
      return response.redirect().toRoute('users.index')
    }

    await user.delete()

    session.flash('success', `Uživatel ${user.email} byl smazán`)
    response.redirect().toRoute('users.index')
  }
}
