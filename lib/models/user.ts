import { query } from '../db';
import { hashPassword, verifyPassword } from '../utils/password';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  password_hash: string;
  role: 'developer' | 'admin';
  status: 'active' | 'restricted' | 'deleted' | 'disabled';
  bio?: string;
  skills?: string[];
  technologies?: string[];
  website?: string;
  github?: string;
  avatar_url?: string;
  restriction_reason?: string;
  restricted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  user_id: string;
  problems_count: number;
  solutions_count: number;
  confirmations_count: number;
  helpful_votes: number;
  connected_agents_count: number;
}

export interface CreateUserInput {
  email: string;
  username: string;
  display_name: string;
  password: string;
  role?: 'developer' | 'admin';
  bio?: string;
  skills?: string[];
  technologies?: string[];
  website?: string;
  github?: string;
}

export interface UpdateUserInput {
  display_name?: string;
  bio?: string;
  skills?: string[];
  technologies?: string[];
  website?: string;
  github?: string;
  avatar_url?: string;
}

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const results = await query<User>(
      'SELECT * FROM users WHERE id = $1 AND status != $2',
      [id, 'deleted']
    );
    return results[0] || null;
  }

  static async findAll(): Promise<User[]> {
    return query<User>(
      'SELECT * FROM users WHERE status != $1 ORDER BY created_at DESC',
      ['deleted']
    );
  }

  static async findByEmail(email: string): Promise<User | null> {
    const results = await query<User>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND status != $2',
      [email, 'deleted']
    );
    return results[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const results = await query<User>(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND status != $2',
      [username, 'deleted']
    );
    return results[0] || null;
  }

  static async create(input: CreateUserInput): Promise<User> {
    const password_hash = await hashPassword(input.password);
    const id = crypto.randomUUID();
    
    const results = await query<User>(
      `INSERT INTO users (
        id, email, username, display_name, password_hash, role, 
        bio, skills, technologies, website, github, status, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        id,
        input.email,
        input.username,
        input.display_name,
        password_hash,
        input.role || 'developer',
        input.bio || null,
        input.skills || [],
        input.technologies || [],
        input.website || null,
        input.github || null,
        'active',
      ]
    );
    
    return results[0];
  }

  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.display_name !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(input.display_name);
    }
    if (input.bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(input.bio);
    }
    if (input.skills !== undefined) {
      updates.push(`skills = $${paramCount++}`);
      values.push(input.skills);
    }
    if (input.technologies !== undefined) {
      updates.push(`technologies = $${paramCount++}`);
      values.push(input.technologies);
    }
    if (input.website !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(input.website);
    }
    if (input.github !== undefined) {
      updates.push(`github = $${paramCount++}`);
      values.push(input.github);
    }
    if (input.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(input.avatar_url);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const results = await query<User>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return results[0] || null;
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    return user;
  }

  static async updateStatus(
    id: string,
    status: User['status'],
    reason?: string
  ): Promise<User | null> {
    const results = await query<User>(
      `UPDATE users 
       SET status = $1, 
           restriction_reason = $2, 
           restricted_at = CASE WHEN $1 = 'restricted' THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $3 
       RETURNING *`,
      [status, reason || null, id]
    );

    return results[0] || null;
  }

  static async updateRole(
    id: string,
    role: User['role']
  ): Promise<User | null> {
    const results = await query<User>(
      `UPDATE users 
       SET role = $1, updated_at = NOW()
       WHERE id = $2 
       RETURNING *`,
      [role, id]
    );

    return results[0] || null;
  }

  static async getStats(userId: string): Promise<UserStats> {
    const results = await query<UserStats>(
      `SELECT 
        user_id,
        COUNT(DISTINCT CASE WHEN table_name = 'problems' THEN id END) as problems_count,
        COUNT(DISTINCT CASE WHEN table_name = 'solutions' THEN id END) as solutions_count,
        SUM(CASE WHEN table_name = 'confirmations' THEN 1 ELSE 0 END) as confirmations_count,
        SUM(CASE WHEN table_name = 'votes' AND vote_type = 'helpful' THEN 1 ELSE 0 END) as helpful_votes,
        COUNT(DISTINCT CASE WHEN table_name = 'agent_connections' THEN id END) as connected_agents_count
       FROM (
         SELECT user_id, id, 'problems' as table_name FROM problems WHERE author_id = $1
         UNION ALL
         SELECT user_id, id, 'solutions' as table_name FROM solutions WHERE author_id = $1
         UNION ALL
         SELECT user_id, id, 'confirmations' as table_name FROM solution_confirmations WHERE user_id = $1
         UNION ALL
         SELECT user_id, id, 'votes' as table_name, vote_type FROM votes WHERE user_id = $1
         UNION ALL
         SELECT user_id, id, 'agent_connections' as table_name FROM agent_connections WHERE user_id = $1
       ) stats
       GROUP BY user_id`,
      [userId]
    );

    return results[0] || {
      user_id: userId,
      problems_count: 0,
      solutions_count: 0,
      confirmations_count: 0,
      helpful_votes: 0,
      connected_agents_count: 0,
    };
  }

  static async list(params?: {
    status?: User['status'];
    role?: User['role'];
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (params?.status) {
      conditions.push(`status = $${paramCount++}`);
      values.push(params.status);
    }

    if (params?.role) {
      conditions.push(`role = $${paramCount++}`);
      values.push(params.role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    values.push(params?.limit || 50);
    values.push(params?.offset || 0);

    return query<User>(
      `SELECT * FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      values
    );
  }

  static toPublic(user: User) {
    const { password_hash, ...publicUser } = user;
    return publicUser;
  }
}
