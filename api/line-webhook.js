export default async function handler(req, res) {
  // Line POST request
  if (req.method === 'POST') {
    try {
      console.log('Line webhook received:', JSON.stringify(req.body, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook failed' });
    }
    return;
  }
  
  // GET request (for testing)
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Line webhook endpoint is working' });
    return;
  }
  
  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}

