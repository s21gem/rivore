import { useState, useEffect } from 'react';

export default function Contact() {
  const [contactData, setContactData] = useState({
    email: 'support@rivore.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fragrance Lane\nNew York, NY 10001\nUnited States',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14604.466542735709!2d90.40427384999999!3d23.7933939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c15cea1e1%3A0x600f68d9f48ac218!2sBanani%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setContactData(prev => ({
            email: data.contactServiceEmail || prev.email,
            phone: data.contactServicePhone || prev.phone,
            address: data.contactHeadquartersAddress || prev.address,
            mapEmbedUrl: data.contactMapEmbedUrl || prev.mapEmbedUrl,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background py-32">
      <div className="container mx-auto px-6 max-w-5xl text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-6 font-medium text-muted-foreground">Get in Touch</p>
        <h1 className="text-5xl md:text-7xl font-serif font-light text-primary mb-12">Contact Us</h1>
        <p className="text-lg md:text-xl font-light text-muted-foreground leading-relaxed mb-24 max-w-3xl mx-auto">
          We'd love to hear from you. Whether you have a question about our fragrances, need assistance with an order, or just want to share your Rivore experience, our team is here to help.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 text-left border-t border-border pt-24">
          <div className="order-2 lg:order-1 space-y-16">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-primary mb-6">Customer Service</h3>
              <div className="space-y-2 text-sm font-light text-muted-foreground">
                <p>Email: <a href={`mailto:${contactData.email}`} className="text-foreground hover:text-primary transition-colors">{contactData.email}</a></p>
                <p>Phone: <a href={`tel:${contactData.phone.replace(/\s/g, '')}`} className="text-foreground hover:text-primary transition-colors">{contactData.phone}</a></p>
                <p className="pt-4 text-xs">Hours: Mon-Fri, 9am - 5pm EST</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-primary mb-6">Headquarters</h3>
              <div className="space-y-1 text-sm font-light text-muted-foreground">
                {contactData.address.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-serif font-light text-foreground mb-10">Send a Message</h2>
            <form className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors" 
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors" 
                    placeholder="Your email address"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Message</label>
                  <textarea 
                    rows={4} 
                    className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Store Location Map (CMS-driven) */}
        {contactData.mapEmbedUrl && (
          <div className="mt-24 md:mt-32 border-t border-border pt-16">
            <h2 className="text-3xl font-serif font-light text-foreground mb-10 text-left">Our Location</h2>
            <div className="w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden border border-[#eeeeee] shadow-sm bg-muted relative group">
              <iframe 
                src={contactData.mapEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'contrast(1.05) saturate(1.05)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Shop Location"
                className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
