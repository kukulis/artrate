import {Ranking} from "../entities";
import {connectDatabase} from '../config/database';

export class RankingRepository {
    async findById(id: string): Promise<Ranking | null> {
        const connection = await connectDatabase();
        try {
            const [rows] = await connection.query<any[]>("select * from rankings where id=?", [id])

            if (rows.length == 0)
                return null;

            return rows[0] as Ranking;
        } finally {
            await connection.end()
        }
    }

    async findByArticleId(articleId: string): Promise<Ranking[]> {
        const connection = await connectDatabase();
        try {
            const [rows] = await connection.query<any[]>("select * from rankings where article_id=?", [articleId])

            return rows as Ranking[];
        } finally {
            await connection.end()
        }
    }

    async createRanking(ranking: Ranking): Promise<Ranking> {
        const connection = await connectDatabase();
        try {
            await connection.query(
                'INSERT INTO rankings (id, ranking_type, helper_type, user_id, article_id, value, description) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?)',
                [ranking.id, ranking.ranking_type, ranking.helper_type, ranking.user_id, ranking.article_id, ranking.value, ranking.description]
            );

            const created = await this.findById(ranking.id);
            if (!created) {
                throw new Error('Failed to retrieve created ranking');
            }
            return created;
        } finally {
            await connection.end();
        }
    }

    async updateRanking(ranking: Ranking): Promise<Ranking> {
        const connection = await connectDatabase();
        try {
            await connection.query(
                'UPDATE rankings ' +
                'set ranking_type =?,' +
                'helper_type=?,' +
                'user_id = ?, ' +
                'article_id =?, ' +
                'value =?, ' +
                'description=?' +
                'WHERE id=?',
                [ranking.ranking_type, ranking.helper_type, ranking.user_id, ranking.article_id, ranking.value, ranking.description, ranking.id]
            );

            const created = await this.findById(ranking.id);
            if (!created) {
                throw new Error('Failed to retrieve created ranking');
            }
            return created;
        } finally {
            await connection.end();
        }
    }
}