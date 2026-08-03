function Home() {
  return (
    <div className="app">
      <h1>MHX Kitchen</h1>

      <p className="subtitle">
        Fotografiere ein Rezept und lass es automatisch erkennen.
      </p>

      <button className="bigScanButton">
        📷
        <br />
        REZEPT SCANNEN
      </button>

      <div className="menuCard">📚 Meine Rezepte</div>
      <div className="menuCard">❤️ Favoriten</div>
      <div className="menuCard">⚙️ Einstellungen</div>
    </div>
  );
}

export default Home;