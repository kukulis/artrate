import {Ranking} from "../entities";
import {connectDatabase} from '../config/database';
import {RankingFilter} from "../types/RankingFilter";

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

    async findWithFilter(filter: RankingFilter): Promise<Ranking[]> {
        const conditions: string[] = [];
        const values: string[] = [];

        if (filter.article_id != null) {
            conditions.push('article_id=?')
            values.push(filter.article_id)
        }

        if (filter.ranking_type != null) {
            conditions.push('ranking_type=?')
            values.push(filter.ranking_type)
        }

        if (filter.ranking_helper != null) {
            conditions.push('ranking_helper=?')
            values.push(filter.ranking_helper)
        }

        if (filter.user_id != null) {
            conditions.push('user_id=?')
            values.push(filter.user_id)
        }

        let conditionsStr = '';
        if (conditions.length > 0) {
            conditionsStr = conditions.join(" AND \n")
        }

        const sql = "select * from rankings " + conditionsStr;

        const connection = await connectDatabase();

        try {
            const [rows] = await connection.query<any[]>(sql, values)
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

            // user id should not be modified ever
            await connection.query(
                'UPDATE rankings ' +
                'set ranking_type =?,' +
                'helper_type=?,' +
                'article_id =?, ' +
                'value =?, ' +
                'description=?' +
                'WHERE id=?',
                [ranking.ranking_type, ranking.helper_type, ranking.article_id, ranking.value, ranking.description, ranking.id]
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

    async deleteRanking(id: string): Promise<boolean> {
        const connection = await connectDatabase();
        try {
            await connection.execute("DELETE FROM rankings where id=?", [id])
        } finally {
            await connection.end()
        }

        return true;
    }
}