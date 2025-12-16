import './Header.css';

export default function Header() {
  return (
    <header className="ice-header">
      {/* 얼음 로고 = 홈 버튼(지금은 동작 없이 버튼만) */}
      <button type="button" className="ice-header__logoBtn" aria-label="홈">
        <img
          className="ice-header__logoImg"
          src="/icons/ssacssac-logo.png"
          alt="홈"
        />
      </button>

      <div className="ice-header__spacer" />

      {/* 로그인 버튼(지금은 동작 없이 버튼만) */}
      <button type="button" className="ice-header__loginBtn">
        <img className="ice-header__loginIcon" src="/icons/login-icon.png" alt="" />
        <span className="ice-header__loginText">LOGIN</span>
      </button>
    </header>
  );
}
