import database from "./database.js";

async function CredentialsValidation(email, password){
    const email_exists = await database.raw(`select * from users where email='${email}'`);
    const email_validation = email.length > 5 && email.length < 20 && email_exists.length == 0;
    const password_validation = /^(?=.*[0-9])(?=.*[a-z])(?=.*[!:?.])[a-z0-9!:?.]{5,20}$/;

    if(!email_validation){
        throw new Error("Email is not valid!");
    }
    else if(!password.match(password_validation)) {
        throw new Error("The password is not valid!");
    }
    else{
        return true;
    }
}

export default CredentialsValidation;