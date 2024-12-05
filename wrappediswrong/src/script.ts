const clientId = "8d1980514f8a4f7ab9537e1ce4e3d825"; // Replace with your client ID
let accessToken: string | null = null;

// On page load, check if there is an authorization code or token in the URL
window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        // Exchange the authorization code for an access token
        accessToken = await getAccessToken(clientId, code);
        history.replaceState(null, "", "/"); // Clean up the URL
        const profile = await fetchProfile(accessToken);
        updateLoginButton(
            profile.display_name,
            profile.images[0]?.url || "",
            profile.id,
            profile.email
        );
    }
};

// Login function triggered by the login button
export async function login() {
    if (accessToken) {
        alert("Already logged in!");
        return;
    }

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    // Create a unique session ID
    const sessionId = Date.now().toString();
    localStorage.setItem("sessionId", sessionId);

    // Save the verifier with the session ID
    localStorage.setItem(`verifier-${sessionId}`, verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://wrappediswrong.com/callback");
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    // Redirect to Spotify's authentication page
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}


// Function to get an access token using the authorization code
export async function getAccessToken(clientId: string, code: string): Promise<string> {
    // Retrieve the session ID and corresponding verifier
    const sessionId = localStorage.getItem("sessionId");
    const verifier = localStorage.getItem(`verifier-${sessionId}`);

    if (!verifier) {
        throw new Error("Code verifier not found. Ensure you started the login flow.");
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://wrappediswrong.com/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    if (!result.ok) {
        const errorData = await result.json();
        console.error("Token exchange failed:", errorData);
        throw new Error("Failed to exchange authorization code for token.");
    }

    const { access_token } = await result.json();
    return access_token;
}


// Fetch the user's Spotify profile
async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });

    return await result.json();
}

// Populate the UI with user profile data

// Update the login button after successful login
function updateLoginButton(displayName: string, imgUrl: string, userId: string, email: string) {
    const loginButton = document.getElementById("login-button")!;

    // Clear existing content
    loginButton.innerHTML = "";

    // Add the "Logged in as" header
    const header = document.createElement("h2");
    header.textContent = `Logged in as ${displayName}`;
    loginButton.appendChild(header);

    // Add the profile image
    const profileImage = new Image(100, 100); // Adjust size as needed
    profileImage.src = imgUrl;
    profileImage.alt = `${displayName}'s Profile Picture`;
    profileImage.style.borderRadius = "50%"; // Make it circular
    loginButton.appendChild(profileImage);

    // Add user details
    const details = document.createElement("ul");
    details.style.listStyleType = "none"; // Remove bullets
    details.style.padding = "0";         // Remove padding
    details.style.margin = "8px 0";      // Adjust margin for spacing
    details.style.textAlign = "center";
    details.innerHTML = `
        <li>User ID: ${userId}</li>
        <li>Email: ${email}</li>
    `;
    loginButton.appendChild(details);

    // Disable the button
    loginButton.setAttribute("disabled", "true");
}

// Generate a code verifier for the PKCE flow
function generateCodeVerifier(length: number) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Generate a code challenge based on the code verifier
async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// Attach login function to the login button
document.getElementById("login-button")!.addEventListener("click", login);

// Fetch user's top artists for a given time range
export async function fetchTopArtists(timeRange: string) {
    if (!accessToken) {
        alert("Please log in first!");
        return;
    }

    const artists = await fetchWebApi(
        `v1/me/top/artists?time_range=${timeRange}&limit=5`,
        "GET"
    );
    const list = document.getElementById(`${timeRange}-artists`);
    if (list) {
        list.innerHTML = artists.items
            .map((artist: any) => {
                const artistImage = artist.images[0]?.url || ""; // Use the first image if available
                return `
                    <li style="display: flex; align-items: center; margin-bottom: 10px;">
                        <img src="${artistImage}" alt="${artist.name}" style="width: 100px; height: 100px; border-radius: 50%; margin-right: 12px;" />
                        <span>${artist.name}</span>
                    </li>
                `;
            })
            .join("");
    }
}

// Fetch user's top tracks for a given time range
export async function fetchTopSongs(timeRange: string) {
    if (!accessToken) {
        alert("Please log in first!");
        return;
    }

    const tracks = await fetchWebApi(
        `v1/me/top/tracks?time_range=${timeRange}&limit=5`,
        "GET"
    );
    const list = document.getElementById(`${timeRange}-songs`);
    if (list) {
        list.innerHTML = tracks.items
            .map((track: any) => {
                const albumImage = track.album.images[0]?.url || ""; // Use the first album image if available
                const artistNames = track.artists.map((artist: any) => artist.name).join(", ");
                return `
                    <li style="display: flex; align-items: center; margin-bottom: 10px;">
                        <img src="${albumImage}" alt="${track.name}" style="width: 100px; height: 100px; border-radius: 6px; margin-right: 12px;" />
                        <div>
                            <span style="font-weight: bold;">${track.name}</span><br />
                            <span style="font-size: 0.9em; color: #555;">by ${artistNames}</span>
                        </div>
                    </li>
                `;
            })
            .join("");
    }
}

// Fetch data from Spotify API
async function fetchWebApi(endpoint: string, method: string, body?: any): Promise<any> {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        method,
        body: JSON.stringify(body),
    });
    return await res.json();
}

// Attach functions to the global window object for HTML onclick handlers
(window as any).fetchTopArtists = fetchTopArtists;
(window as any).fetchTopSongs = fetchTopSongs;

