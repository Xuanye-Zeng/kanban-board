package middleware

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const TokenKey contextKey = "token"

// Auth extracts the Supabase JWT from the Authorization header
// and puts the user_id into the request context.
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error":"missing or invalid authorization header"}`, http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		// Decode JWT payload (we trust Supabase has validated it via RLS)
		parts := strings.Split(token, ".")
		if len(parts) != 3 {
			http.Error(w, `{"error":"invalid token format"}`, http.StatusUnauthorized)
			return
		}

		payload, err := base64.RawURLEncoding.DecodeString(parts[1])
		if err != nil {
			http.Error(w, `{"error":"invalid token payload"}`, http.StatusUnauthorized)
			return
		}

		var claims map[string]interface{}
		if err := json.Unmarshal(payload, &claims); err != nil {
			http.Error(w, `{"error":"invalid token claims"}`, http.StatusUnauthorized)
			return
		}

		sub, ok := claims["sub"].(string)
		if !ok || sub == "" {
			http.Error(w, `{"error":"missing user id in token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, sub)
		ctx = context.WithValue(ctx, TokenKey, token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(r *http.Request) string {
	return r.Context().Value(UserIDKey).(string)
}

func GetToken(r *http.Request) string {
	return r.Context().Value(TokenKey).(string)
}
