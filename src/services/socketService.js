import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.presentationId = null;
        this.callbacks = {
            onUserJoin: () => { },
            onUserLeave: () => { },
            onPresentationUpdate: () => { },
            onOnlineUsers: () => { },
        };
    }

    connect(presentationId) {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user?.email) {
            console.error('❌ 未登录或缺少用户信息');
            return;
        }

        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

        this.socket = io(SOCKET_URL, {
            path: '/socket.io',
            auth: { token },
            query: { token }
        });

        this.presentationId = presentationId;
        this.setupListeners(user.email);
    }

    setupListeners(userEmail) {
        // 连接成功
        this.socket.on('connect', () => {
            console.log('✅ WebSocket 连接成功');
            // 加入演示文稿房间
            this.socket.emit('joinPresentation', {
                presentationId: this.presentationId,
                email: userEmail
            });
        });

        // 连接错误
        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket 连接错误:', error.message);
        });

        // 修改在线用户更新的处理
        this.socket.on('onlineUsers', (data) => {
            console.log('👥 在线用户更新:', data);
            if (this.callbacks.onOnlineUsers && typeof data.count === 'number') {
                this.callbacks.onOnlineUsers(data);
            }
        });

        // 添加用户加入事件处理
        this.socket.on('userJoined', (data) => {
            console.log('👤 新用户加入:', data);
            if (this.callbacks.onOnlineUsers && typeof data.count === 'number') {
                this.callbacks.onOnlineUsers(data);
            }
        });

        // 添加用户离开事件处理
        this.socket.on('userLeft', (data) => {
            console.log('👤 用户离开:', data);
            if (this.callbacks.onOnlineUsers && typeof data.count === 'number') {
                this.callbacks.onOnlineUsers(data);
            }
        });

        // 演示文稿更新
        this.socket.on('presentationUpdated', (update) => {
            console.log('📝 收到演示文稿更新:', update);
            this.callbacks.onPresentationUpdate(update);
        });
    }

    // 发送演示文稿更新
    emitUpdate(update) {
        if (this.socket && this.presentationId) {
            this.socket.emit('presentationUpdate', {
                presentationId: this.presentationId,
                update
            });
        }
    }

    // 设置回调函数
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // 离开房间
    leavePresentation() {
        if (this.socket && this.presentationId) {
            const userEmail = JSON.parse(localStorage.getItem('user'))?.email;
            this.socket.emit('leavePresentation', {
                presentationId: this.presentationId,
                email: userEmail
            });
        }
    }

    // 断开连接
    disconnect() {
        if (this.socket) {
            this.leavePresentation();
            this.socket.disconnect();
            this.socket = null;
            this.presentationId = null;
        }
    }
}

export const socketService = new SocketService();