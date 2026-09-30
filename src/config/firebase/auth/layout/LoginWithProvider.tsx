import { loginWithGoogle } from "../auth.service";
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft } from 'react-icons/fa';

const classes = "flex w-fit h-fit aspect-square cursor-pointer"

export function LoginWithGoogle() {
    async function handleLogin() {
        try { await loginWithGoogle(); }
        catch (error) { console.error(error); }
    }

    return (<button className={classes} onClick={handleLogin}><FcGoogle size="40" /></button>);
}

export function LoginWithMicrosoft() {
    async function handleLogin() {
        try { await loginWithGoogle(); }
        catch (error) { console.error(error); }
    }

    return (<button className={classes} onClick={handleLogin}><FaMicrosoft size="40" /></button>);
}
