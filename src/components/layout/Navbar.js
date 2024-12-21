// Navbar.js
export default function Navbar({ 
  communities = [], 
  onHomeClick, 
  onCreateCommunity, 
  onCommunitySelect,
  selectedCommunity,
  currentView,
  authState,
}) {
  const handleCommunityClick = (community) => {
    // debugging
    console.log('Clicked community:', community);
    onCommunitySelect(community);
  };

  
  return (
    <div className="sidebar">
      <div className="button-container">
        <button 
          className={`home_sidebar ${currentView === 'home' ? 'active' : ''}`}
          onClick={onHomeClick}
        >
          Home
        </button>
      </div>
      <h1>Communities</h1>
      <button 
        className={`home_sidebar ${currentView === 'newCommunity' ? 'active' : ''}`}
        style={{ opacity: authState?.type === 'guest' ? 0.15 : 1 }}
        onClick={authState?.type !== 'guest' ? onCreateCommunity : undefined}
      >
        Create Community
      </button>
      <div className="comm_list">
        {communities.map((community) => (
          <button
            key={community._id}
            onClick={() => handleCommunityClick(community)}
            className={`community-button ${selectedCommunity?._id === community._id ? 'active' : ''}`} // unique key
          >
            {community.name}
          </button>
        ))}
      </div>
    </div>
  );
}