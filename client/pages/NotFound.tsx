import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Page Not Found" hideNavigation>
      <div className="p-4 text-center py-12">
        <div className="text-8xl mb-6">🎲</div>
        <h1 className="text-3xl font-bold mb-4">404</h1>
        <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 rounded-2xl py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-3">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
