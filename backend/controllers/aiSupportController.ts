import type { Request, Response } from 'express';
// TEMP stub: simple echo so backend runs without OpenAI complexity
export const aiSupportHandler = async (req: Request, res: Response) => {
  return res.json({
    answer: 'TEMP: AI endpoint wired correctly',
    echo: req.body,
  });
};
