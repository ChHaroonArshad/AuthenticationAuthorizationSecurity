import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  // --------------------------------
  // REFRESH ACCESS TOKEN
  // --------------------------------
const refreshAccessToken = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/user/refresh",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    console.log("Refresh response:", data);

    if (!response.ok) {
      console.log("Refresh failed:", data.message);

      localStorage.removeItem("accessToken");
      navigate("/login");

      return;
    }

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    console.log("New access token saved");

  } catch (error) {
    console.error(
      "Refresh request error:",
      error
    );
  }
};
  // --------------------------------
  // RUN WHEN HOME LOADS
  // --------------------------------

  useEffect(() => {
    refreshAccessToken();
  }, []);


  // --------------------------------
  // LOGOUT
  // --------------------------------

  const handleLogout = () => {

    localStorage.removeItem("accessToken");

    navigate("/login");
  };


  return (
    <div className="home-page">

      {/* Navbar */}

      <nav className="home-navbar">

        <div className="home-logo">
          User<span>HUB</span>
        </div>

        <div className="nav-right">

          <div className="user-avatar">
            A
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* Main */}

      <main className="home-main">

        {/* Welcome */}

        <section className="welcome-section">

          <div>

            <p className="home-eyebrow">
              DASHBOARD
            </p>

            <h1>
              Welcome back, Ali.
            </h1>

            <p className="welcome-text">
              Here's what's happening with your account today.
            </p>

          </div>

          <div className="date-box">

            <span>
              Today
            </span>

            <strong>
              {new Date().toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </strong>

          </div>

        </section>


        {/* Stats */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              👤
            </div>

            <div>

              <p>
                Total Users
              </p>

              <h2>
                1
              </h2>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div>

              <p>
                Your Posts
              </p>

              <h2>
                0
              </h2>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <p>
                Account Status
              </p>

              <h2>
                Active
              </h2>

            </div>

          </div>

        </section>


        {/* Content */}

        <section className="dashboard-grid">

          {/* Profile */}

          <div className="dashboard-card profile-card">

            <div className="card-header">

              <div>

                <p className="card-eyebrow">
                  PROFILE
                </p>

                <h2>
                  Your account
                </h2>

              </div>

              <div className="large-avatar">
                A
              </div>

            </div>


            <div className="profile-info">

              <div>

                <span>
                  Name
                </span>

                <strong>
                  Ali Khan
                </strong>

              </div>


              <div>

                <span>
                  Email
                </span>

                <strong>
                  ali@example.com
                </strong>

              </div>

            </div>


            <button className="secondary-button">
              View profile →
            </button>

          </div>


          {/* Quick Actions */}

          <div className="dashboard-card">

            <p className="card-eyebrow">
              QUICK ACTIONS
            </p>

            <h2>
              What would you like to do?
            </h2>

            <div className="action-list">

              <button className="action-button">

                <span className="action-icon">
                  📝
                </span>

                <div>

                  <strong>
                    Create a post
                  </strong>

                  <small>
                    Share something with the community
                  </small>

                </div>

                <span>
                  →
                </span>

              </button>


              <button className="action-button">

                <span className="action-icon">
                  👤
                </span>

                <div>

                  <strong>
                    Edit profile
                  </strong>

                  <small>
                    Update your account information
                  </small>

                </div>

                <span>
                  →
                </span>

              </button>


              <button className="action-button">

                <span className="action-icon">
                  ⚙
                </span>

                <div>

                  <strong>
                    Settings
                  </strong>

                  <small>
                    Manage your preferences
                  </small>

                </div>

                <span>
                  →
                </span>

              </button>

            </div>

          </div>

        </section>


        {/* Bottom */}

        <section className="activity-card">

          <div>

            <p className="card-eyebrow">
              GET STARTED
            </p>

            <h2>
              Your dashboard is ready.
            </h2>

            <p>
              Start creating posts and exploring the application.
              More features will appear here as we build the project.
            </p>

          </div>

          <button className="primary-button">
            Create your first post →
          </button>

        </section>

      </main>

    </div>
  );
};

export default Home;