import React from 'react'
import { useAuth } from '../../../hooks/useAuth';


const Super_Contract = () => {
    const { useMe: { data: { user: { decoded } } } } = useAuth();
    console.log(decoded?.role)
    return (
        <div>
            this is contract page
        </div>
    );
}
export default Super_Contract;