const users = [
  { id: 1, name: 'User 1' },
  { id: 2, name: 'User 2' }
]

export const getUsersRepository = async () => {
  return users
}

export const createUserRepository = async (data: any) => {
  const newUser = {
    id: users.length + 1,
    ...data
  }

  users.push(newUser)

  return newUser
}
