const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.DB_FILE = path.join(__dirname, 'database.json');
        this.data = this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(this.DB_FILE)) {
                const content = JSON.parse(fs.readFileSync(this.DB_FILE, 'utf8'));
                console.log(`✅ Database loaded: ${content.users?.length || 0} users, ${content.products?.length || 0} products, ${content.scripts?.length || 0} scripts`);
                return {
                    users: content.users || [],
                    products: content.products || [],
                    scripts: content.scripts || [],
                    transactions: content.transactions || [],
                    pendingDeposits: content.pendingDeposits || [],
                    settings: content.settings || {
                        min_deposit: 10000,
                        max_deposit: 1000000,
                        maintenance: false
                    }
                };
            } else {
                const defaultData = {
                    users: [
                        {
                            id: 6838042480,
                            username: "Cukkk",
                            first_name: "Cukkk",
                            last_name: "",
                            balance: 0,
                            level: "Bronze",
                            total_spent: 0,
                            total_deposit: 0,
                            joined: new Date().toISOString(),
                            last_active: new Date().toISOString(),
                            purchased_items: []
                        }
                    ],
                    products: [
                        {
                            id: "P1735123456789",
                            name: "Mobile Legends Account - All Heroes & Skins",
                            price: 250000,
                            login_method: "Moonton Account",
                            email: "sample1@example.com",
                            password: "password123",
                            description: "Akun Mobile Legends dengan semua hero dan skin, level 30, mythic rank",
                            photo_id: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop",
                            status: "available",
                            created_at: new Date().toISOString(),
                            sold_at: null,
                            sold_to: null
                        }
                    ],
                    scripts: [
                        {
                            id: "S1735123456789",
                            name: "Auto Claim Bot Premium",
                            price: 75000,
                            description: "Bot untuk auto claim coin dari berbagai platform",
                            features: "• Auto claim coin\n• Multi account support\n• Proxy support\n• Anti-ban system\n• Easy setup",
                            file_id: "",  // INI AKAN DIISI SAAT ADMIN UPLOAD FILE
                            file_name: "auto_claim_bot.zip",
                            file_size: 1024000,
                            file_type: ".zip",
                            downloads: 0,
                            status: "available",
                            created_at: new Date().toISOString(),
                            sold_at: null,
                            sold_to: null
                        }
                    ],
                    transactions: [],
                    pendingDeposits: [],
                    settings: {
                        min_deposit: 10000,
                        max_deposit: 1000000,
                        maintenance: false
                    }
                };
                
                fs.writeFileSync(this.DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
                console.log('✅ Created new JSON database with sample data');
                return defaultData;
            }
        } catch (error) {
            console.error('❌ Error loading database:', error.message);
            return {
                users: [],
                products: [],
                scripts: [],
                transactions: [],
                pendingDeposits: [],
                settings: {
                    min_deposit: 10000,
                    max_deposit: 1000000,
                    maintenance: false
                }
            };
        }
    }

    saveData() {
        try {
            fs.writeFileSync(this.DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            console.error('❌ Error saving database:', error.message);
        }
    }

    // ========== USER METHODS ==========
    async getUser(userId, from = {}) {
        try {
            let user = this.data.users.find(u => u.id === userId);
            
            if (!user) {
                user = {
                    id: userId,
                    username: from.username || `user_${userId}`,
                    first_name: from.first_name || 'User',
                    last_name: from.last_name || '',
                    balance: 0,
                    level: 'Bronze',
                    total_spent: 0,
                    total_deposit: 0,
                    joined: new Date().toISOString(),
                    last_active: new Date().toISOString(),
                    purchased_items: []
                };
                
                this.data.users.push(user);
                this.saveData();
                console.log(`👤 New user created: ${user.first_name} (${userId})`);
            } else {
                user.last_active = new Date().toISOString();
                if (from.username) user.username = from.username;
                if (from.first_name) user.first_name = from.first_name;
                if (from.last_name !== undefined) user.last_name = from.last_name || '';
                
                this.saveData();
            }
            
            return user;
        } catch (error) {
            console.error('Error in getUser:', error);
            return {
                id: userId,
                username: from.username || `user_${userId}`,
                first_name: from.first_name || 'User',
                balance: 0,
                level: 'Bronze',
                total_spent: 0,
                total_deposit: 0,
                purchased_items: []
            };
        }
    }

    async getUsers() {
        return this.data.users;
    }

    async updateUser(userId, updateData) {
        const userIndex = this.data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;
        
        this.data.users[userIndex] = { ...this.data.users[userIndex], ...updateData };
        this.saveData();
        return true;
    }

    // ========== PRODUCT METHODS ==========
    async getAvailableProducts() {
        return this.data.products.filter(p => p.status === 'available');
    }

    async getProduct(productId) {
        return this.data.products.find(p => p.id === productId) || null;
    }

    async getProducts() {
        return this.data.products;
    }

    async addProduct(productData) {
        try {
            const product = {
                id: 'P' + Date.now(),
                ...productData,
                created_at: new Date().toISOString(),
                status: 'available',
                sold_at: null,
                sold_to: null
            };
            
            this.data.products.push(product);
            this.saveData();
            return product;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // ========== DELETE PRODUCT ==========
    async deleteProduct(productId) {
        try {
            const productIndex = this.data.products.findIndex(p => p.id === productId);
            
            if (productIndex === -1) {
                return false;
            }
            
            // Remove product from array
            this.data.products.splice(productIndex, 1);
            this.saveData();
            
            console.log(`🗑️ Product ${productId} deleted from database`);
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    async purchaseProduct(userId, productId) {
        try {
            const user = this.data.users.find(u => u.id === userId);
            const product = this.data.products.find(p => p.id === productId && p.status === 'available');
            
            if (!product) return null;
            if (user.balance < product.price) return false;
            
            // Update user
            user.balance -= product.price;
            user.total_spent += product.price;
            user.purchased_items.push({
                product_id: product.id,
                product_name: product.name,
                type: 'product',
                price: product.price,
                purchased_at: new Date().toISOString(),
                details: {
                    email: product.email,
                    password: product.password,
                    login_method: product.login_method
                }
            });
            
            // Update product
            product.status = 'sold';
            product.sold_at = new Date().toISOString();
            product.sold_to = userId;
            
            // Add transaction
            this.data.transactions.push({
                id: 'T' + Date.now(),
                type: 'purchase',
                user_id: userId,
                product_id: productId,
                product_type: 'product',
                amount: product.price,
                status: 'completed',
                timestamp: new Date().toISOString()
            });
            
            this.saveData();
            
            return {
                user,
                product
            };
        } catch (error) {
            console.error('Error in purchaseProduct:', error);
            throw error;
        }
    }

    // ========== SCRIPT METHODS ==========
    async addScript(scriptData) {
        try {
            const script = {
                id: 'S' + Date.now(),
                ...scriptData,
                created_at: new Date().toISOString(),
                status: 'available',
                sold_at: null,
                sold_to: null,
                downloads: 0
            };
            
            this.data.scripts.push(script);
            this.saveData();
            return script;
        } catch (error) {
            console.error('Error adding script:', error);
            throw error;
        }
    }

    async getScript(scriptId) {
        return this.data.scripts.find(s => s.id === scriptId) || null;
    }

    async getAvailableScripts() {
        return this.data.scripts.filter(s => s.status === 'available');
    }

    async getScripts() {
        return this.data.scripts;
    }

    // ========== DELETE SCRIPT ==========
    async deleteScript(scriptId) {
        try {
            const scriptIndex = this.data.scripts.findIndex(s => s.id === scriptId);
            
            if (scriptIndex === -1) {
                return false;
            }
            
            // Remove script from array
            this.data.scripts.splice(scriptIndex, 1);
            this.saveData();
            
            console.log(`🗑️ Script ${scriptId} deleted from database`);
            return true;
        } catch (error) {
            console.error('Error deleting script:', error);
            return false;
        }
    }

    async purchaseScript(userId, scriptId) {
        try {
            const user = this.data.users.find(u => u.id === userId);
            const script = this.data.scripts.find(s => s.id === scriptId && s.status === 'available');
            
            if (!script) return null;
            if (user.balance < script.price) return false;
            
            // Update user
            user.balance -= script.price;
            user.total_spent += script.price;
            user.purchased_items.push({
                script_id: script.id,
                script_name: script.name,
                type: 'script',
                price: script.price,
                purchased_at: new Date().toISOString(),
                file_id: script.file_id,
                file_name: script.file_name,
                file_type: script.file_type
            });
            
            // Update script
            script.status = 'sold';
            script.sold_at = new Date().toISOString();
            script.sold_to = userId;
            script.downloads += 1;
            
            // Add transaction
            this.data.transactions.push({
                id: 'T' + Date.now(),
                type: 'purchase',
                user_id: userId,
                product_id: scriptId,
                product_type: 'script',
                amount: script.price,
                status: 'completed',
                timestamp: new Date().toISOString()
            });
            
            this.saveData();
            
            return {
                user,
                script
            };
        } catch (error) {
            console.error('Error in purchaseScript:', error);
            throw error;
        }
    }

    // ========== DEPOSIT METHODS ==========
    async createPendingDeposit(userId, amount, method) {
        try {
            const deposit = {
                id: 'D' + Date.now(),
                user_id: userId,
                amount: amount,
                method: method,
                status: 'pending',
                created_at: new Date().toISOString(),
                processed_at: null,
                processed_by: null,
                proof_sent: false
            };
            
            this.data.pendingDeposits.push(deposit);
            this.saveData();
            return deposit;
        } catch (error) {
            console.error('Error in createPendingDeposit:', error);
            throw error;
        }
    }

    async getPendingDepositByDepositId(depositId) {
        return this.data.pendingDeposits.find(d => d.id === depositId) || null;
    }

    async getPendingDeposits() {
        return this.data.pendingDeposits.filter(d => d.status === 'pending');
    }

    async approveDeposit(depositId, adminId) {
        try {
            const deposit = this.data.pendingDeposits.find(d => d.id === depositId);
            
            if (!deposit || deposit.status !== 'pending') {
                return { success: false, message: 'Deposit not found or already processed' };
            }
            
            // Update deposit
            deposit.status = 'approved';
            deposit.processed_at = new Date().toISOString();
            deposit.processed_by = adminId;
            deposit.proof_sent = true;
            
            // Update user
            const user = this.data.users.find(u => u.id === deposit.user_id);
            if (user) {
                user.balance += deposit.amount;
                user.total_deposit += deposit.amount;
                user.last_active = new Date().toISOString();
            }
            
            // Add transaction
            this.data.transactions.push({
                id: deposit.id,
                type: 'deposit',
                user_id: deposit.user_id,
                product_id: '',
                amount: deposit.amount,
                method: deposit.method,
                status: 'completed',
                timestamp: new Date().toISOString(),
                processed_by: adminId
            });
            
            this.saveData();
            
            return {
                success: true,
                deposit,
                user_id: deposit.user_id,
                amount: deposit.amount
            };
        } catch (error) {
            console.error('Error in approveDeposit:', error);
            throw error;
        }
    }

    async rejectDeposit(depositId, adminId) {
        try {
            const deposit = this.data.pendingDeposits.find(d => d.id === depositId);
            
            if (!deposit || deposit.status !== 'pending') {
                return false;
            }
            
            deposit.status = 'rejected';
            deposit.processed_at = new Date().toISOString();
            deposit.processed_by = adminId;
            deposit.proof_sent = true;
            
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error in rejectDeposit:', error);
            return false;
        }
    }

    // ========== SETTINGS & STATS ==========
    async getSettings() {
        return this.data.settings;
    }

    async updateSettings(newSettings) {
        Object.assign(this.data.settings, newSettings);
        this.saveData();
        return true;
    }

    async getTransactions(type = null) {
        if (type) {
            return this.data.transactions.filter(t => t.type === type);
        }
        return this.data.transactions;
    }

    async getUserStats() {
        return {
            totalUsers: this.data.users.length,
            totalProducts: this.data.products.length,
            availableProducts: this.data.products.filter(p => p.status === 'available').length,
            soldProducts: this.data.products.filter(p => p.status === 'sold').length,
            totalScripts: this.data.scripts.length,
            availableScripts: this.data.scripts.filter(s => s.status === 'available').length,
            soldScripts: this.data.scripts.filter(s => s.status === 'sold').length,
            totalDownloads: this.data.scripts.reduce((sum, script) => sum + script.downloads, 0),
            totalDeposit: this.data.users.reduce((sum, user) => sum + user.total_deposit, 0),
            totalSales: this.data.users.reduce((sum, user) => sum + user.total_spent, 0),
            totalTransactions: this.data.transactions.length,
            pendingDeposits: this.data.pendingDeposits.filter(d => d.status === 'pending').length
        };
    }
}

const db = new Database();

module.exports = {
    db,
    initializeDB: async () => {
        console.log('✅ JSON Database initialized');
        return db;
    }
};