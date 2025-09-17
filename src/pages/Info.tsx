import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  Home,
  Route,
  FileText
} from "lucide-react";

const emergencyContacts = [
  {
    service: "Police Department",
    number: "911",
    notes: "For immediate danger or crime"
  },
  {
    service: "Fire Department", 
    number: "911",
    notes: "For fires and hazardous material spills"
  },
  {
    service: "Ambulance/Medical",
    number: "911", 
    notes: "For medical emergencies"
  },
  {
    service: "Disaster Hotline",
    number: "1-800-XXX-XXXX",
    notes: "National disaster assistance"
  },
  {
    service: "Local Emergency Mgmt",
    number: "311 (Non-Emergency)",
    notes: "Local information and services"
  }
];

const safetyGuidelines = [
  {
    icon: FileText,
    title: "Prepare an Emergency Kit",
    description: "Assemble a kit with essential supplies like water, food, first aid, and tools for at least 3 days."
  },
  {
    icon: Route,
    title: "Know Evacuation Routes", 
    description: "Familiarize yourself with multiple escape routes from your home and community."
  },
  {
    icon: AlertTriangle,
    title: "Stay Informed",
    description: "Monitor official alerts and news from local authorities and trusted sources."
  },
  {
    icon: Home,
    title: "Secure Your Home",
    description: "Fasten down heavy furniture, reinforce windows, and check for potential hazards."
  },
  {
    icon: Users,
    title: "Practice Drills",
    description: "Regularly practice your family emergency plan, including meeting points and communication methods."
  },
  {
    icon: Shield,
    title: "Help Your Neighbors",
    description: "Check on elderly or vulnerable neighbors after a disaster."
  }
];

const faqs = [
  {
    question: "What should I include in an emergency kit?",
    answer: "An emergency kit should include water (one gallon per person per day), non-perishable food, a battery-powered radio, flashlight, tools to turn off utilities, a manual can opener, local maps, and a cell phone with chargers and a backup battery. Consider adding prescription medications, infant formula, pet food, and important family documents."
  },
  {
    question: "How do I create a family emergency plan?",
    answer: "Start by identifying potential hazards in your area, establish meeting places both near your home and outside your neighborhood, choose an out-of-area contact person, and ensure everyone knows how to contact each other. Practice your plan regularly and keep copies of important documents in a waterproof container."
  },
  {
    question: "What are the common emergency alert systems?",
    answer: "Common systems include Emergency Alert System (EAS) broadcasts on TV and radio, Wireless Emergency Alerts (WEA) on cell phones, local notification systems via email and text, and NOAA Weather Radio for weather-related emergencies."
  },
  {
    question: "How can I prepare my home for a disaster?",
    answer: "Secure heavy furniture and appliances, install smoke and carbon monoxide detectors, know how to shut off utilities, trim trees near your home, and consider structural improvements like storm shutters or safe rooms depending on your area's risks."
  },
  {
    question: "What is the importance of knowing evacuation routes?",
    answer: "Knowing multiple evacuation routes ensures you can quickly and safely leave your area during an emergency. Traffic patterns change during disasters, and primary routes may be blocked. Having alternatives saves precious time and could save lives."
  }
];

export default function Info() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation userType="public" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Safety Information & Guidelines
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Essential information to help you prepare for and respond to emergency situations.
          </p>
        </div>

        <div className="space-y-12">
          {/* Safety Guidelines */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Safety Guidelines: Do's and Don'ts</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safetyGuidelines.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        <span>{guideline.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {guideline.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Emergency Contacts */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
              <Phone className="h-6 w-6" />
              <span>Emergency Contacts</span>
            </h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">Service</th>
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">Contact Number</th>
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emergencyContacts.map((contact, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50">
                          <td className="py-4 px-6 font-medium text-foreground">
                            {contact.service}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className="font-mono">
                              {contact.number}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-muted-foreground">
                            {contact.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}