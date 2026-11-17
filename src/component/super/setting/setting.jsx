import React from "react"
import { Tab_C } from "../../tab"

import {
    User,
    Settings,
    FileText
} from 'lucide-react';
import { Policies } from "./policies";
import { Personal } from "./personal";
import { General_Setting } from "./generalSetting";
const Admin = {
    Personal: Personal,
    General_Setting: General_Setting,
    Policies: Policies
}
const AdminTabTitle = [
    { title: "Personal", icon: User, key: "Personal" },
    { title: "General_Setting", icon: Settings, key: "General_Setting" },
    { title: "Policies", icon: FileText, key: "Policies" }
]
export const S_A_Setting = () => {

    return (
        <>
            <Tab_C content={Admin} tab={AdminTabTitle} />
        </>
    )
}