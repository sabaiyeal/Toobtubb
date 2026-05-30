Export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Line webhook received:', req.body);
      
      // ตอนนี้แค่ return 200 ก่อน
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Webhook failed' });
    }
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Line webhook endpoint is working' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
