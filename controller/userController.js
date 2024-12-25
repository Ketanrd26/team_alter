import passport from "passport";

const userRegister = async ()=>{

    await passport.authenticate("goggle",{
        scope:[
            "profile", "email"
        ]
    })

}

const goggleRegisterCallBack = async ()=>{
await passport.authenticate("goggle",{
    failureRedirect:"/login"
})
}

const gogglesuccess = async ()=>{
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
        message: "Registration successful",
        user: req.user, 
    });
}

export {userRegister,goggleRegisterCallBack, gogglesuccess}