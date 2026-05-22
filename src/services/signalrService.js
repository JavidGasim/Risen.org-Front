import * as signalR from "@microsoft/signalr";

let connection = null;

export const startSignalRConnection = async (token) => {
    if (connection) return connection;

    const API_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/notificationHub`, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.onclose((err) => {
        console.log("SignalR Closed:", err);
    });

    connection.onreconnecting(() => {
        console.log("SignalR Reconnecting...");
    });

    connection.onreconnected(() => {
        console.log("SignalR Reconnected");
    });

    await connection.start();

    console.log("SignalR Connected");

    return connection;
};

export const stopSignalRConnection = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};

export const getSignalRConnection = () => connection;