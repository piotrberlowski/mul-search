"use server"
import {signIn, signOut} from "@/app/auth"

export async function logIn() {
    await signIn()
}

export async function logOut() {
    await signOut()
}