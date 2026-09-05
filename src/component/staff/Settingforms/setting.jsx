import React from "react"
import { Personal } from "../Settingforms/personal.jsx"
import { Profile } from "../Settingforms/profile.jsx"
import { Tab_C } from "../../tab.jsx"
import { ChangePassword } from "../Settingforms/changePassword.jsx"
import {
    User,
    MessageSquare,
    Unlock,
} from 'lucide-react';
const Staff = {
    Profile: Profile,
    Personal: Personal,
    ChangePassword: ChangePassword
}
const StaffTabTitle = [
    { title: "Profile", icon: User, key: "Profile" },
    { title: "Personal", icon: MessageSquare, key: "Personal" },
    { title: "ChangePassword", icon: Unlock, key: "ChangePassword" }
]
export const S_Setting = () => {

    return (
        <main className="w-full px-3 py-4 sm:px-5 lg:px-7">
            <div className="mx-auto w-full max-w-[1440px]">
                <header className="mb-5 flex flex-col gap-1 border-b border-slate-200 pb-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Workspace</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Staff settings</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage your profile, personal information, and password.</p>
                    </div>
                    <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:inline-flex">Account preferences</span>
                </header>

                <Tab_C content={Staff} tab={StaffTabTitle} className="w-full" />
            </div>
        </main>
    )
}