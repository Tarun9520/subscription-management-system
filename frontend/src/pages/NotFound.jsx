import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout sidebar={false}>
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-brand-600">404</h1>
          <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Page not found
          </p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary mt-6 inline-flex">
            Go Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
