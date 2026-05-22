import { useEffect, useMemo, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getCookie } from "../utils/cookie";

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "https://risen-org-back.onrender.com";
};

const useSignalR = ({ hubPath = "/notificationHub", enabled = true } = {}) => {
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState(enabled ? "connecting" : "disabled");
  const [error, setError] = useState(null);

  const url = useMemo(() => {
    if (!enabled) return null;
    return `${getBaseUrl()}${hubPath}`;
  }, [hubPath, enabled]);

  useEffect(() => {
    if (!enabled || !url) {
      setConnection(null);
      setStatus("disabled");
      return;
    }

    let active = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => getCookie("risen_token"),
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    setStatus("connecting");

    connection
      .start()
      .then(() => {
        if (!active) return;
        setConnection(connection);
        setStatus("connected");
      })
      .catch((err) => {
        if (!active) return;
        console.error("SignalR connect failed:", err);
        setError(err);
        setStatus("failed");
      });

    return () => {
      active = false;
      connection.stop().catch(() => {});
    };
  }, [url, enabled]);

  return { connection, status, error };
};

export default useSignalR;
