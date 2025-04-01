import Head from 'next/head';
import App from '../client/src/App';
import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Task Planner AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <App />
      </main>
    </>
  );
};

export default Home;