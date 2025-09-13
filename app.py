from flask import Flask, render_template, request, redirect, url_for, send_from_directory, flash
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = "supersecret"  # needed for flash messages
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_materials_flat():
    materials = {}
    for subj in os.listdir(UPLOAD_FOLDER):
        subj_path = os.path.join(UPLOAD_FOLDER, subj)
        if not os.path.isdir(subj_path):
            continue
        materials[subj] = []
        for root, _, files in os.walk(subj_path):
            for f in files:
                rel = os.path.relpath(os.path.join(root, f), UPLOAD_FOLDER)
                materials[subj].append(rel.replace("\\", "/"))
        if not materials[subj]:
            del materials[subj]
    return materials

@app.route("/")
def index():
    materials = get_materials_flat()
    return render_template("index.html", materials=materials, now=datetime.now)

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        subject = request.form.get("subject_select")
        new_subject = request.form.get("new_subject", "").strip()
        if new_subject:
            subject = new_subject
        subject = subject.strip() or "General"

        subtopic = request.form.get("subtopic", "").strip()
        target_folder = os.path.join(app.config["UPLOAD_FOLDER"], subject)
        if subtopic:
            target_folder = os.path.join(target_folder, subtopic)
        os.makedirs(target_folder, exist_ok=True)

        file = request.files.get("file")
        if file and file.filename:
            file.save(os.path.join(target_folder, file.filename))
            flash("File uploaded successfully!", "success")
        return redirect(url_for("upload"))

    subjects = [
        subj for subj in os.listdir(app.config["UPLOAD_FOLDER"])
        if os.path.isdir(os.path.join(app.config["UPLOAD_FOLDER"], subj))
    ]
    materials = get_materials_flat()
    return render_template("upload.html", subjects=subjects, materials=materials, now=datetime.now)

@app.route("/delete/<path:filename>", methods=["POST"])
def delete_file(filename):
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        flash(f"Deleted: {filename}", "danger")
    else:
        flash("File not found!", "warning")
    return redirect(url_for("upload"))

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=False)

if __name__ == "__main__":
    app.run(debug=True)
