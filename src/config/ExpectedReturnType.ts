export class ExpectedReturnType<T> {
    code: number
    message: string
    data: Array<T>
}

export class UserReturnType {
    uid: string
    full_name: string
    avatar: string
}