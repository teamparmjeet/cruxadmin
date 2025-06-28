// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// This is the main configuration object for NextAuth
const handler = NextAuth({
    // We are using a JWT session strategy
    session: {
        strategy: "jwt",
    },
    // This is where you configure your login providers
    providers: [
        // We are using the "Credentials" provider, which allows for email/password login
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // The credentials is used to generate a suitable form on the sign-in page.
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" },
            },

            // The `authorize` function is where you call your own API to validate credentials
            async authorize(credentials, req) {
                // This is where you fetch from your Node.js backend
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: credentials?.email,
                        password: credentials?.password,
                    }),
                    headers: { "Content-Type": "application/json" }
                });

                const responseData = await res.json();

                // If the response from your API is not OK, return null
                if (!res.ok || !responseData) {
                    console.error("Failed to login:", responseData);
                    return null;
                }

                // The responseData from your API should include the user object and the token
                // We will attach the token to the user object to be used in the JWT callback
                const user = {
                    ...responseData.user, // Spread user details from your API
                    accessToken: responseData.token, // Add the token here
                };

                // If everything is fine, return the user object.
                // NextAuth will then create a JWT with this object.
                if (user) {
                    return user;
                } else {
                    return null;
                }
            }
        }),
    ],
    // Callbacks are functions that are called during the execution of NextAuth.js
    callbacks: {
        // This callback is called whenever a JWT is created or updated.
        async jwt({ token, user }) {
            // If `user` object exists (it only does on sign-in), we are adding properties to the token
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user._id;
                token.username = user.username;
                token.role = user.role;
            }
            return token;
        },

        // This callback is called whenever a session is checked.
        async session({ session, token }) {
            // We are adding the properties from the JWT (token) to the session object
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.username = token.username;
                session.accessToken = token.accessToken;
            }
            return session;
        }
    },
    // Custom pages
    pages: {
        signIn: '/login', //Tells NextAuth to use our custom login page
        error: '/login', // Redirect to login on error
    }
});

// Export the handler for both GET and POST requests
export { handler as GET, handler as POST };