/**
 * news-api.js
 * Logic for fetching news from Firestore.
 */

// If using global Firestore (via CDN script):
const db = firebase.firestore();

export const newsApi = {
    /**
     * Fetch the most recent news for the ticker.
     */
    async getLatestNews(limit = 3) {
        try {
            const snapshot = await db.collection("notizie")
                .where("status", "==", "published")
                .orderBy("createdAt", "desc")
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching latest news:", error);
            return [];
        }
    },

    /**
     * Fetch featured news for the hero section.
     */
    async getFeaturedNews() {
        try {
            const snapshot = await db.collection("notizie")
                .where("status", "==", "published")
                .where("isFeatured", "==", true)
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();
            if (snapshot.empty) {
                // Return latest if no featured news
                return this.getLatestNews(1);
            }
            const doc = snapshot.docs[0];
            return [{ id: doc.id, ...doc.data() }];
        } catch (error) {
            console.error("Error fetching featured news:", error);
            return [];
        }
    },

    /**
     * Fetch news by category.
     */
    async getNewsByCategory(category) {
        try {
            let query = db.collection("notizie")
                .where("status", "==", "published");
            
            if (category && category !== 'Tutte') {
                query = query.where("tags", "array-contains", category);
            }
            
            const snapshot = await query.orderBy("createdAt", "desc").get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching news by category:", error);
            return [];
        }
    },

    /**
     * Fetch a specific news item by ID.
     */
    async getNewsById(id) {
        try {
            const doc = await db.collection("notizie").doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error("Error fetching news by ID:", error);
            return null;
        }
    },

    /**
     * Fetch related news based on tags.
     */
    async getRelatedNews(tags, currentId, limit = 2) {
        try {
            if (!tags || tags.length === 0) return this.getLatestNews(limit);
            
            const snapshot = await db.collection("notizie")
                .where("status", "==", "published")
                .where("tags", "array-contains-any", tags)
                .limit(limit + 1)
                .get();
            
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(item => item.id !== currentId)
                .slice(0, limit);
        } catch (error) {
            console.error("Error fetching related news:", error);
            return [];
        }
    },

    /**
     * Fetch all unique tags from published news.
     */
    async getAllTags() {
        try {
            const snapshot = await db.collection("notizie")
                .where("status", "==", "published")
                .get();
            
            const tagsSet = new Set();
            snapshot.forEach(doc => {
                const tags = doc.data().tags || [];
                tags.forEach(t => tagsSet.add(t));
            });
            
            return Array.from(tagsSet).sort();
        } catch (error) {
            console.error("Error fetching all tags:", error);
            return [];
        }
    },

    /**
     * Admin: Login check.
     * Searches for a user with the given username and checks the password.
     */
    async login(username, password) {
        try {
            const snapshot = await db.collection("credenzialiAdmin")
                .where("username", "==", username)
                .get();
            
            if (snapshot.empty) return null;
            
            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();
            
            if (userData.password === password) {
                return {
                    id: userDoc.id, // Full Name (e.g. Luca Parlavecchia)
                    username: userData.username
                };
            }
            return null;
        } catch (error) {
            console.error("Error during login:", error);
            return null;
        }
    },

    /**
     * Admin: Get all news (including private status).
     */
    async getAllNewsAdmin() {
        try {
            const snapshot = await db.collection("notizie")
                .orderBy("createdAt", "desc")
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching all news for admin:", error);
            return [];
        }
    },

    /**
     * Admin: Create a new news document.
     */
    async createNews(data) {
        try {
            const now = firebase.firestore.Timestamp.now();
            const docRef = await db.collection("notizie").add({
                ...data,
                createdAt: now,
                updatedAt: now,
                publishedAt: data.status === 'published' ? now : null,
                likes: 0,
                views: 0
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating news:", error);
            throw error;
        }
    },

    /**
     * Admin: Update an existing news document.
     */
    async updateNews(id, data) {
        try {
            const now = firebase.firestore.Timestamp.now();
            const updatePayload = {
                ...data,
                updatedAt: now
            };
            // If status changed to published and it wasn't before, set publishedAt
            if (data.status === 'published') {
                updatePayload.publishedAt = now;
            }
            
            await db.collection("notizie").doc(id).update(updatePayload);
            return true;
        } catch (error) {
            console.error("Error updating news:", error);
            throw error;
        }
    },

    /**
     * Admin: Delete a news document.
     */
    async deleteNews(id) {
        try {
            await db.collection("notizie").doc(id).delete();
            return true;
        } catch (error) {
            console.error("Error deleting news:", error);
            throw error;
        }
    },

    /**
     * Search news by title, subtitle, or tags.
     * Perfoms a client-side filter for simplicity and speed on small datasets.
     */
    async searchNews(query) {
        try {
            const lowerQuery = query.toLowerCase();
            const snapshot = await db.collection("notizie")
                .where("status", "==", "published")
                .orderBy("createdAt", "desc")
                .get();
            
            const results = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const title = (data.title || "").toLowerCase();
                const subtitle = (data.subtitle || "").toLowerCase();
                const tags = (data.tags || []).map(t => t.toLowerCase());
                
                if (title.includes(lowerQuery) || 
                    subtitle.includes(lowerQuery) || 
                    tags.some(t => t.includes(lowerQuery))) {
                    results.push({ id: doc.id, ...data });
                }
            });
            
            return results;
        } catch (error) {
            console.error("Error searching news:", error);
            return [];
        }
    }
};
