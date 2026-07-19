import * as signalR from "@microsoft/signalr";

let notificationConnection = null;
let communityConnection = null;
let friendConnection = null;

const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://risen-org-back.onrender.com";

// ---------------- Notification ----------------

export const startNotificationSignalRConnection = async (token) => {
    if (notificationConnection) return notificationConnection;

    notificationConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/notificationHub`, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    await notificationConnection.start();

    console.log("Notification SignalR Connected");

    return notificationConnection;
};

export const getNotificationSignalRConnection = () => notificationConnection;

// ---------------- Community ----------------

export const startCommunitySignalRConnection = async (token) => {
    if (communityConnection) return communityConnection;

    communityConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/communityHub`, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    await communityConnection.start();

    console.log("Community SignalR Connected");

    return communityConnection;
};

export const getCommunitySignalRConnection = () => communityConnection;

export const startFriendSignalRConnection = async (token) => {
    if (friendConnection) return friendConnection;

    friendConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/friendHub`, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    await friendConnection.start();

    console.log("Friend SignalR Connected");

    return friendConnection;
};

export const getFriendSignalRConnection = () => friendConnection;

// ---------------- Stop ----------------

export const stopSignalRConnections = async () => {
    if (notificationConnection) {
        await notificationConnection.stop();
        notificationConnection = null;
    }

    if (communityConnection) {
        await communityConnection.stop();
        communityConnection = null;
    }

    if (friendConnection) {
        await friendConnection.stop();
        friendConnection = null;
    }
};