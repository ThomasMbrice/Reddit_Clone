import '../../stylesheets/global.css';

export default function Banner({ onSearch, onCreatePost, currentView, authState, onPhredditClick, onLogout, onProfileClick }) {
//  console.log('Banner authState:', authState); // debugging

  return (
    <div className="header">
      <div className="left-section">
        <button
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
            //onPhredditClick();
          }}
          className="logo"
        >
          Phreddit
        </button>
        <input
          className="search_main"
          placeholder="Search Phreddit…"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="right-section">
        <button
          className={`create_post ${currentView === 'newPost' ? 'active' : ''}`}
          onClick={authState?.type !== 'guest' ? onCreatePost : undefined}
          style={{ opacity: authState?.type === 'guest' ? 0.15 : 1 }}
        >
          Create Post +
        </button>
        {authState?.type === 'user' && (
          <button
            onClick={onProfileClick}
            className={`home_sidebar ${currentView === 'profile' ? 'active' : ''}`}
          >
            {authState.user.user.displayName}
          </button>
        )}
        {authState?.type === 'guest' && (
          <span className="guest-label">Guest</span>
        )}
        {authState?.type === 'user' && (
          <button onClick={onLogout} className="logoutbttn">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}