export function calculateCosineSimilarity(user1Books, user2Books) {
    let dotProduct = 0;
    let normUser1 = 0;
    let normUser2 = 0;

    for (let i = 0; i < user1Books.length; i++) {
        dotProduct += user1Books[i] * user2Books[i];
        normUser1 += user1Books[i] * user1Books[i];
        normUser2 += user2Books[i] * user2Books[i];
    }

    normUser1 = Math.sqrt(normUser1);
    normUser2 = Math.sqrt(normUser2);

    if (normUser1 === 0 || normUser2 === 0) return 0;

    return dotProduct / (normUser1 * normUser2);
}