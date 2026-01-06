import {Ranking} from "../entities";
import {RankingFilter} from "../types/RankingFilter";
import {Pool} from "mysql2/promise";

export class RankingRepository {

    public constructor(private pool: Pool) {
    }

    async findById(id: string): Promise<Ranking | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>("select * from rankings where id=?", [id])

            if (rows.length == 0)
                return null;

            return rows[0] as Ranking;
        } finally {
            connection.release()
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
            conditions.push('helper_type=?')
            values.push(filter.ranking_helper)
        }

        if (filter.user_id != null) {
            conditions.push('user_id=?')
            values.push(String(filter.user_id))
        }

        if (filter.not_id != null) {
            conditions.push('id != ?')
            values.push(filter.not_id)
        }

        let conditionsStr = '';
        if (conditions.length > 0) {
            conditionsStr = 'WHERE ' + conditions.join(" AND \n")
        }

        const sql = "select * from rankings " + conditionsStr;

        const connection = await this.pool.getConnection();

        try {
            const [rows] = await connection.query<any[]>(sql, values)
            return rows as Ranking[];
        } finally {
            connection.release()
        }
    }

    async createRanking(ranking: Ranking): Promise<Ranking> {
        const connection = await this.pool.getConnection();
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
            connection.release();
        }
    }

    async updateRanking(ranking: Ranking): Promise<Ranking> {
        const connection = await this.pool.getConnection();
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
            connection.release();
        }
    }

    async deleteRanking(id: string): Promise<boolean> {
        const connection = await this.pool.getConnection();
        try {
            await connection.execute("DELETE FROM rankings where id=?", [id])
            return true;
        } finally {
            connection.release()
        }

    }

    async upsertRankings(rankings: Ranking[]): Promise<void> {
        if (rankings.length === 0) {
            return;
        }

        const connection = await this.pool.getConnection();
        try {
            const values = rankings.map(ranking => {
                const values = [
                    ranking.id,
                    ranking.ranking_type,
                    ranking.helper_type,
                    ranking.user_id,
                    ranking.article_id,
                    ranking.value,
                    ranking.description
                ];
                const escapedValues = values.map((value) => connection.escape(value))
                const escapedValuesStr = escapedValues.join(', ')

                return '('+escapedValuesStr+')';
            }).join(",\n");

            const sql = `
                INSERT INTO rankings (id, ranking_type, helper_type, user_id, article_id, value, description)
                VALUES ${values} ON DUPLICATE KEY
                UPDATE value = VALUES (value), 
                       description = VALUES (description)`;

            await connection.query(sql);
        } finally {
            connection.release();
        }
    }
}