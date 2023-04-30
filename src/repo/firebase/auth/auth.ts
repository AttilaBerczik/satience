import {useState, useEffect} from "react";
import {getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword} from "firebase/auth";
import {AuthUser} from "../../../common/types";

const auth = getAuth();

const formatAuthUser = (user: User): AuthUser => ({
    uid: user.uid,
    email: user.email,
    name: user.displayName,
});

const useFirebaseAuth = () => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // listen for Firebase state change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoading(true);
                const formattedUser = formatAuthUser(user);
                setAuthUser(formattedUser);
                setLoading(false);
            } else {
                setLoading(false);
                setAuthUser(null);
                return;
            }
        });
        return () => unsubscribe();
    }, []);

    return {
        authUser,
        loading,
    };
};

export {useFirebaseAuth};
