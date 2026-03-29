package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// SupabaseClient wraps HTTP calls to the Supabase PostgREST API.
type SupabaseClient struct {
	URL    string
	APIKey string
}

func NewSupabaseClient() *SupabaseClient {
	return &SupabaseClient{
		URL:    os.Getenv("SUPABASE_URL"),
		APIKey: os.Getenv("SUPABASE_ANON_KEY"),
	}
}

func (s *SupabaseClient) request(method, path, token string, body interface{}, headers map[string]string) ([]byte, int, error) {
	url := fmt.Sprintf("%s/rest/v1/%s", s.URL, path)

	var reqBody io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		reqBody = bytes.NewReader(data)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("apikey", s.APIKey)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	// Default: return representation after insert/update
	if method == http.MethodPost || method == http.MethodPatch {
		req.Header.Set("Prefer", "return=representation")
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return data, resp.StatusCode, nil
}

func (s *SupabaseClient) Get(path, token string, headers map[string]string) ([]byte, int, error) {
	return s.request(http.MethodGet, path, token, nil, headers)
}

func (s *SupabaseClient) Post(path, token string, body interface{}, headers map[string]string) ([]byte, int, error) {
	return s.request(http.MethodPost, path, token, body, headers)
}

func (s *SupabaseClient) Patch(path, token string, body interface{}, headers map[string]string) ([]byte, int, error) {
	return s.request(http.MethodPatch, path, token, body, headers)
}

func (s *SupabaseClient) Delete(path, token string, headers map[string]string) ([]byte, int, error) {
	return s.request(http.MethodDelete, path, token, nil, headers)
}

// writeJSON is a helper to write JSON responses.
func writeJSON(w http.ResponseWriter, status int, data []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
