import { query } from '../db';

export interface Problem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'verified' | 'investigating' | 'archived';
  context: string;
  environment: Record<string, any>;
  error_message?: string;
  symptoms: string[];
  root_cause?: string;
  tags: string[];
  author_id: string;
  helpful_votes: number;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface FailedAttempt {
  id: string;
  problem_id: string;
  description: string;
  result: 'failed' | 'partial';
  reason: string;
  order_index: number;
  created_at: Date;
}

export interface Solution {
  id: string;
  problem_id: string;
  title: string;
  state: 'proposed' | 'verified' | 'deprecated';
  code?: string;
  explanation: string;
  why_it_works: string;
  trade_offs?: string;
  limitations?: string;
  author_id: string;
  confirmation_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface SolutionConfirmation {
  id: string;
  solution_id: string;
  user_id: string;
  environment: Record<string, any>;
  version_info: string;
  notes?: string;
  created_at: Date;
}

export interface Discussion {
  id: string;
  problem_id: string;
  author_id: string;
  content: string;
  type: 'question' | 'confirmation' | 'experience' | 'suggestion';
  version_reported?: string;
  votes: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProblemInput {
  title: string;
  context: string;
  environment: Record<string, any>;
  error_message?: string;
  symptoms: string[];
  tags: string[];
  author_id: string;
  status?: Problem['status'];
}

export interface CreateSolutionInput {
  problem_id: string;
  title: string;
  code?: string;
  explanation: string;
  why_it_works: string;
  trade_offs?: string;
  limitations?: string;
  author_id: string;
  state?: Solution['state'];
}

export interface CreateFailedAttemptInput {
  problem_id: string;
  description: string;
  result: 'failed' | 'partial';
  reason: string;
  order_index: number;
}

export class ProblemModel {
  static async findById(id: string): Promise<Problem | null> {
    const results = await query<Problem>(
      'SELECT * FROM problems WHERE id = $1',
      [id]
    );
    return results[0] || null;
  }

  static async findBySlug(slug: string): Promise<Problem | null> {
    const results = await query<Problem>(
      'SELECT * FROM problems WHERE slug = $1',
      [slug]
    );
    return results[0] || null;
  }

  static async create(input: CreateProblemInput): Promise<Problem> {
    const id = crypto.randomUUID();
    const slug = this.generateSlug(input.title);

    const results = await query<Problem>(
      `INSERT INTO problems (
        id, title, slug, status, context, environment, 
        error_message, symptoms, tags, author_id, 
        helpful_votes, view_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0, NOW(), NOW())
      RETURNING *`,
      [
        id,
        input.title,
        slug,
        input.status || 'published',
        input.context,
        JSON.stringify(input.environment),
        input.error_message || null,
        input.symptoms,
        input.tags,
        input.author_id,
      ]
    );

    return results[0];
  }

  static async update(
    id: string,
    updates: Partial<Omit<Problem, 'id' | 'author_id' | 'created_at'>>
  ): Promise<Problem | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'author_id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const results = await query<Problem>(
      `UPDATE problems SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return results[0] || null;
  }

  static async search(params: {
    query?: string;
    tags?: string[];
    status?: Problem['status'];
    author_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ problems: Problem[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (params.query) {
      conditions.push(`(
        title ILIKE $${paramCount} OR 
        context ILIKE $${paramCount} OR 
        error_message ILIKE $${paramCount} OR
        root_cause ILIKE $${paramCount}
      )`);
      values.push(`%${params.query}%`);
      paramCount++;
    }

    if (params.tags && params.tags.length > 0) {
      conditions.push(`tags && $${paramCount}::text[]`);
      values.push(params.tags);
      paramCount++;
    }

    if (params.status) {
      conditions.push(`status = $${paramCount}`);
      values.push(params.status);
      paramCount++;
    }

    if (params.author_id) {
      conditions.push(`author_id = $${paramCount}`);
      values.push(params.author_id);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResults = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM problems ${whereClause}`,
      values
    );

    values.push(params.limit || 20);
    values.push(params.offset || 0);

    const problems = await query<Problem>(
      `SELECT * FROM problems 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      values
    );

    return {
      problems,
      total: parseInt(countResults[0]?.count?.toString() || '0'),
    };
  }

  static async incrementViewCount(id: string): Promise<void> {
    await query(
      'UPDATE problems SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );
  }

  static async addHelpfulVote(id: string): Promise<void> {
    await query(
      'UPDATE problems SET helpful_votes = helpful_votes + 1 WHERE id = $1',
      [id]
    );
  }

  static async getWithDetails(id: string) {
    const problem = await this.findById(id);
    if (!problem) return null;

    const [attempts, solutions, discussions] = await Promise.all([
      FailedAttemptModel.findByProblemId(id),
      SolutionModel.findByProblemId(id),
      DiscussionModel.findByProblemId(id),
    ]);

    return {
      ...problem,
      attempts,
      solutions,
      discussions,
    };
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}

export class FailedAttemptModel {
  static async create(input: CreateFailedAttemptInput): Promise<FailedAttempt> {
    const id = crypto.randomUUID();

    const results = await query<FailedAttempt>(
      `INSERT INTO failed_attempts (
        id, problem_id, description, result, reason, order_index, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [
        id,
        input.problem_id,
        input.description,
        input.result,
        input.reason,
        input.order_index,
      ]
    );

    return results[0];
  }

  static async findByProblemId(problemId: string): Promise<FailedAttempt[]> {
    return query<FailedAttempt>(
      'SELECT * FROM failed_attempts WHERE problem_id = $1 ORDER BY order_index ASC',
      [problemId]
    );
  }

  static async delete(id: string): Promise<boolean> {
    const results = await query(
      'DELETE FROM failed_attempts WHERE id = $1',
      [id]
    );
    return results.length > 0;
  }
}

export class SolutionModel {
  static async create(input: CreateSolutionInput): Promise<Solution> {
    const id = crypto.randomUUID();

    const results = await query<Solution>(
      `INSERT INTO solutions (
        id, problem_id, title, state, code, explanation, 
        why_it_works, trade_offs, limitations, author_id, 
        confirmation_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, NOW(), NOW())
      RETURNING *`,
      [
        id,
        input.problem_id,
        input.title,
        input.state || 'proposed',
        input.code || null,
        input.explanation,
        input.why_it_works,
        input.trade_offs || null,
        input.limitations || null,
        input.author_id,
      ]
    );

    return results[0];
  }

  static async findById(id: string): Promise<Solution | null> {
    const results = await query<Solution>(
      'SELECT * FROM solutions WHERE id = $1',
      [id]
    );
    return results[0] || null;
  }

  static async findByProblemId(problemId: string): Promise<Solution[]> {
    return query<Solution>(
      'SELECT * FROM solutions WHERE problem_id = $1 ORDER BY confirmation_count DESC, created_at DESC',
      [problemId]
    );
  }

  static async addConfirmation(
    solutionId: string,
    userId: string,
    environment: Record<string, any>,
    versionInfo: string,
    notes?: string
  ): Promise<SolutionConfirmation> {
    const id = crypto.randomUUID();

    const results = await query<SolutionConfirmation>(
      `INSERT INTO solution_confirmations (
        id, solution_id, user_id, environment, version_info, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [id, solutionId, userId, JSON.stringify(environment), versionInfo, notes || null]
    );

    // Increment confirmation count
    await query(
      'UPDATE solutions SET confirmation_count = confirmation_count + 1 WHERE id = $1',
      [solutionId]
    );

    return results[0];
  }

  static async getConfirmations(solutionId: string): Promise<SolutionConfirmation[]> {
    return query<SolutionConfirmation>(
      'SELECT * FROM solution_confirmations WHERE solution_id = $1 ORDER BY created_at DESC',
      [solutionId]
    );
  }
}

export class DiscussionModel {
  static async create(
    problemId: string,
    authorId: string,
    content: string,
    type: Discussion['type'],
    versionReported?: string
  ): Promise<Discussion> {
    const id = crypto.randomUUID();

    const results = await query<Discussion>(
      `INSERT INTO discussions (
        id, problem_id, author_id, content, type, version_reported, votes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 0, NOW(), NOW())
      RETURNING *`,
      [id, problemId, authorId, content, type, versionReported || null]
    );

    return results[0];
  }

  static async findByProblemId(problemId: string): Promise<Discussion[]> {
    return query<Discussion>(
      'SELECT * FROM discussions WHERE problem_id = $1 ORDER BY votes DESC, created_at DESC',
      [problemId]
    );
  }

  static async addVote(id: string): Promise<void> {
    await query(
      'UPDATE discussions SET votes = votes + 1 WHERE id = $1',
      [id]
    );
  }
}
