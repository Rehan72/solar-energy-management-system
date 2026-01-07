import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-solar-borderLight dark:border-solar-bgActive">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-solar-textSecondaryLight dark:text-solar-textSecondaryDark">
              © 2024 Solar Energy Management System. All rights reserved.
            </div>
            <div className="mt-2 md:mt-0 text-sm text-solar-textSecondaryLight dark:text-solar-textSecondaryDark">
              Powered by Renewable Energy Solutions
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;