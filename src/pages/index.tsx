const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

const Home = () => {
    console.log(authDomain);
    return (
        <>
            <p>Hello World</p>
        </>
    );
};

export default Home;
