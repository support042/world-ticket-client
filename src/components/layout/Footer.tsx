import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Trust badges */}
        {/* <div className="flex flex-wrap justify-center gap-8 mb-8 pb-8 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">100% Order Guarantee</p>
              <p className="text-xs text-muted-foreground">Buy and sell with 100% confidence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Resell Anytime</p>
              <p className="text-xs text-muted-foreground">Resell your tickets at any time</p>
            </div>
          </div>
        </div> */}

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-foreground transition-colors">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground transition-colors">User Agreement</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Notice</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Notice</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Popular Events</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">World Cup 2026</Link></li>
              <li><Link to="/concerts" className="hover:text-foreground transition-colors">Concerts</Link></li>
              <li><Link to="/sports" className="hover:text-foreground transition-colors">Sports</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">ticket</span>
            <span className="text-xl font-bold">apoint</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Every order is 100% guaranteed
          </p>
          {/* <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">USD</span>
            <span className="text-sm text-muted-foreground">EN</span>
          </div> */}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} Ticketapoint. All rights reserved.
        </p>
      </div>
    </footer>
  )
}