const apiFetch = async (url, options = {}) => {
  // Get access token from localStorage
  const accessToken = localStorage.getItem("accessToken");

  // -----------------------------
  // 1. Make the original request
  // -----------------------------

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // -----------------------------
  // 2. Access token expired
  // -----------------------------

  if (response.status === 401) {

    console.log("Access token expired. Refreshing...");

    // -----------------------------
    // 3. Ask backend for new token
    // -----------------------------

    const refreshResponse = await fetch(
      "http://localhost:3000/user/refresh",
      {
        method: "POST",
        credentials: "include",
      }
    );

    // -----------------------------
    // 4. Refresh token failed
    // -----------------------------

    if (!refreshResponse.ok) {

      console.log("Refresh token expired or invalid.");

      localStorage.removeItem("accessToken");

      window.location.href = "/login";

      return response;
    }

    // -----------------------------
    // 5. Get new access token
    // -----------------------------

    const refreshData = await refreshResponse.json();

    const newAccessToken = refreshData.accessToken;

    // -----------------------------
    // 6. Save new access token
    // -----------------------------

    localStorage.setItem(
      "accessToken",
      newAccessToken
    );

    console.log("New access token received.");

    // -----------------------------
    // 7. Retry original request
    // -----------------------------

    response = await fetch(url, {
      ...options,

      headers: {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      },

      credentials: "include",
    });
  }

  // -----------------------------
  // 8. Return response
  // -----------------------------

  return response;
};

export default apiFetch;









































// const apiFetch = async (url, options = {}) => {
//   let accessToken = localStorage.getItem("accessToken");
//   const refreshToken = localStorage.getItem("refreshToken");

//   // Add access token to the request
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//     Authorization: `Bearer ${accessToken}`,
//   };

//   let response = await fetch(url, {
//     ...options,
//     headers,
//   });

//   // Access token expired
//   if (response.status === 401 && refreshToken) {
//     const refreshResponse = await fetch(
//       "http://localhost:3000/user/refresh",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           refreshToken: refreshToken,
//         }),
//       }
//     );

//     if (!refreshResponse.ok) {
//       // Refresh token is also invalid/expired
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");

//       window.location.href = "/login";

//       return response;
//     }

//     const refreshData = await refreshResponse.json();

//     const newAccessToken = refreshData.accessToken;

//     // Save new access token
//     localStorage.setItem("accessToken", newAccessToken);

//     // Retry original request with new token
//     response = await fetch(url, {
//       ...options,
//       headers: {
//         ...headers,
//         Authorization: `Bearer ${newAccessToken}`,
//       },
//     });
//   }

//   return response;
// };

// export default apiFetch;