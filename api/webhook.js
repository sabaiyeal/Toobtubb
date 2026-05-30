export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      console.log('Line webhook:', req.body);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true });
  }
  
  return res.status(405).end();
};
