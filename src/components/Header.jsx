import logo from './assets/candle-logo.svg';

function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="Candly Logo" className="logo" />
      <h1>Candly</h1>
    </header>
  );
}
