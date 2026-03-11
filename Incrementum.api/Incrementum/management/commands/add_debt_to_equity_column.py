from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Add debt_to_equity column to stock table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            try:
                # Add the column if it doesn't exist
                cursor.execute("""
                    ALTER TABLE incrementum.stock 
                    ADD COLUMN IF NOT EXISTS debt_to_equity NUMERIC(12, 4);
                """)
                
                self.stdout.write(
                    self.style.SUCCESS('Successfully added debt_to_equity column to stock table')
                )
                
                # Verify the column was added
                cursor.execute("""
                    SELECT column_name, data_type, numeric_precision, numeric_scale
                    FROM information_schema.columns
                    WHERE table_schema = 'incrementum' 
                      AND table_name = 'stock'
                      AND column_name = 'debt_to_equity';
                """)
                
                result = cursor.fetchone()
                if result:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Column verified: {result[0]} ({result[1]}, precision={result[2]}, scale={result[3]})'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('Column not found after adding - this may be normal if it already existed')
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error adding column: {str(e)}')
                )
                raise
