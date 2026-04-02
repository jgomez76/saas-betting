async function getData() {
  const res = await fetch("http://127.0.0.1:8000/match/value?home=Arsenal&away=Chelsea");
  return res.json();
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Value Bets</h1>

      <pre className="mt-4 bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}