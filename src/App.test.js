import { render, screen } from "@testing-library/react";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

test("renders home heading", () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
  expect(
    screen.getByRole("heading", { name: /online complaint management/i }),
  ).toBeInTheDocument();
});
