const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;

const Home = () => {
    console.log(authDomain);
    return (
        <>
            <p>Hello World</p>
        </>
    );
};

export default Home;
